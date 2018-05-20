<?php

namespace CoreBundle\Traits;

use FOS\RestBundle\Context\Context;
use FOS\RestBundle\View\View;
use FOS\UserBundle\Model\UserInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * Class ApiTrait
 * @package CoreBundle\Traits
 * @author Dmytro Feshchenko <dimafe2000@gmail.com>
 */
trait ApiTrait
{
    use ContainerAwareTrait;

    /**
     * Return REST view form errors
     * @param Form $form
     * @return View
     */
    public function renderFormErrorView(Form $form)
    {
        if (!count($this->getFormErrorMessages($form))) {
            return View::create($form);
        } else {
            return View::create($this->getFormErrorMessages($form), Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Ger array of form errors
     * @param Form $form
     * @return array
     */
    private function getFormErrorMessages(Form $form)
    {
        $errors = [];

        if ($form->count() > 0) {
            foreach ($form->all() as $child) {
                /**
                 * @var Form $child
                 */
                if (!$child->isValid()) {
                    $errors['errors'][$child->getName()] = $this->getFormErrorMessages($child) ?: [
                        'errors' => [
                            $this->container->get('translator')->trans('This field is missing.', [], 'validators'),
                        ],
                    ];
                }
            }
        } else {
            /**
             * @var FormError $error
             */
            foreach ($form->getErrors(true) as $key => $error) {
                if ($error->getMessagePluralization() !== null) {
                    $errors['errors'][] =
                        /** @Ignore */
                        $this->container->get('translator')->transChoice(
                            $error->getMessage(),
                            $error->getMessagePluralization(),
                            $error->getMessageParameters()
                        );
                } else {
                    $errors['errors'][] =
                        /** @Ignore */
                        $this->container->get('translator')->trans($error->getMessage());
                }
            }
        }

        return $errors;
    }

    /**
     * Return REST view response
     * @param string|object $data
     * @param int $code
     * @param array $groups
     * @return View
     */
    public function createResponse($data = null, $groups = null, $code = Response::HTTP_OK)
    {
        $viewContext = new Context();
        if (null !== $groups) {
            $viewContext->setGroups($groups);
        }

        $returnData = ['code' => $code];

        if (is_string($data)) {
            $returnData['message'] = $data;
        } elseif (null !== $data) {
            $returnData = $data;
        } else {
            $returnData = [];
        }

        return View::create($returnData, $code)->setContext($viewContext);
    }

    /**
     * Get form data ParameterBag
     * @param FormInterface $form
     * @return ParameterBag
     * @deprecated
     */
    public function getFormData(FormInterface $form)
    {
        $data      = is_array($form->getData()) ? $form->getData() : [];
        $extraData = is_array($form->getExtraData()) ? $form->getExtraData() : [];

        $allData = array_merge($data, $extraData);

        return new ParameterBag($allData);
    }

    /**
     * Creates and returns a Form instance from the type of the form.
     *
     * @param string $type The fully qualified class name of the form type
     * @param mixed $data The initial data for the form
     * @param array $options Options for the form
     *
     * @return Form
     */
    protected function createForm($type, $data = null, array $options = [])
    {
        return $this->container->get('form.factory')->create($type, $data, $options);
    }

    /**
     * Get authorized user
     * @param bool $throwException
     * @return UserInterface|null
     */
    protected function getUser($throwException = false)
    {
        if (!$this->container->has('security.token_storage')) {
            throw new \LogicException('The SecurityBundle is not registered in your application.');
        }

        $token = $this->container->get('security.token_storage')->getToken();
        $user  = null === $token ? null : !is_object($token->getUser()) ? null : $token->getUser();

        if ($throwException && null === $user) {
            throw new NotFoundHttpException(
                $this->container->get('translator')->trans('exceptions.user.not.found', [], 'UserBundle')
            );
        }

        return $user;
    }

    /**
     * Returns an AccessDeniedException.
     *
     * This will result in a 403 response code. Usage example:
     *
     *     throw $this->createAccessDeniedException('Unable to access this page!');
     *
     * @param string $message A message
     * @param \Exception|null $previous The previous exception
     *
     * @return AccessDeniedException
     */
    protected function createAccessDeniedException($message = 'Access Denied.', \Exception $previous = null)
    {
        return new AccessDeniedException($message, $previous);
    }

    /**
     * Checks if the attributes are granted against the current authentication token and optionally supplied object.
     *
     * @param mixed $attributes The attributes
     * @param mixed $object The object
     *
     * @return bool
     *
     * @throws \LogicException
     */
    protected function isGranted($attributes, $object = null)
    {
        if (!$this->container->has('security.authorization_checker')) {
            throw new \LogicException('The SecurityBundle is not registered in your application.');
        }

        return $this->container->get('security.authorization_checker')->isGranted($attributes, $object);
    }

    /**
     * Throws an exception unless the attributes are granted against the current authentication token and optionally
     * supplied object.
     *
     * @param mixed $attributes The attributes
     * @param mixed $object The object
     * @param string $message The message passed to the exception
     *
     * @throws AccessDeniedException
     */
    protected function denyAccessUnlessGranted($attributes, $object = null, $message = 'Access Denied.')
    {
        if (!$this->isGranted($attributes, $object)) {
            throw $this->createAccessDeniedException($message);
        }
    }
}
