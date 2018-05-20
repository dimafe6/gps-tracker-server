<?php

namespace CoreBundle\Controller;

use CoreBundle\Traits\DataTablesTrait;
use JMS\Serializer\SerializationContext;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\Form;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class BaseController
 *
 * @category PHP
 * @package  CoreBundle\Controller
 * @author   Dmytro Feshchenko <dimafe2000@gmail.com>
 */
class BaseController extends Controller
{
    use DataTablesTrait;

    /**
     * @param Form $form
     * @return array
     * @author Dmytro Feshchenko <dimafe2000@gmail.com>
     */
    public function getFormErrors(Form $form)
    {
        $errors = [];

        foreach ($form->getErrors() as $key => $error) {
            $errors[] = $error->getMessage();
        }

        foreach ($form->all() as $child) {
            if (!$child->isValid()) {
                $errors[$child->getName()] = $this->getFormErrors($child);
            }
        }

        return $errors;
    }

    /**
     * @param null $message
     * @return JsonResponse
     * @author Dmytro Feshchenko <dimafe2000@gmail.com>
     */
    public function createSuccessJsonResponse($message = null)
    {
        return $this->createJsonResponse($status = Response::HTTP_OK, $errors = [], $message, $headers = []);
    }

    /**
     * @param int $status
     * @param array $errors
     * @param null $message
     * @param array $headers
     * @return JsonResponse
     * @author Dmytro Feshchenko <dimafe2000@gmail.com>
     */
    public function createJsonResponse($status = Response::HTTP_OK, $errors = [], $message = null, $headers = [])
    {
        $responseData = [];

        if ($message) {
            $responseData['message'] = $message;
        }

        if ($errors) {
            $responseData['errors'] = $errors;
        }

        return new JsonResponse($responseData, $status, $headers);
    }

    /**
     * @param $document
     * @param array $groups
     * @return JsonResponse
     * @author Oleg Davydyuk <ilveann@gmail.gov.ua>
     */
    public function serializedJsonResponse($document, $groups = [])
    {
        $serializer = $this->get('jms_serializer');

        $context = SerializationContext::create();
        $context->setGroups($groups)->setSerializeNull(true);

        $json = $serializer->serialize($document, 'json', $context);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    /**
     * @param $location
     * @return JsonResponse
     * @author Oleg Davydyuk <ilveann@gmail.com>
     */
    public function ajaxRedirect($location)
    {
        $ajaxResponse = new JsonResponse();
        $ajaxResponse->headers->set('X-Location', $location);

        return $ajaxResponse;
    }
}
