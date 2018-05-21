<?php

namespace CoreBundle\EventListener;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

/**
 * Class ExceptionListener
 *
 * @category PHP
 * @package  CoreBundle\EventListener
 * @author   Dmytro Feshchenko <dimafe2000@gmail.com>
 */
class ExceptionListener
{
    protected $kernel;

    /**
     * ExceptionListener constructor.
     * @param Kernel $kernel
     */
    public function __construct(Kernel $kernel)
    {
        $this->kernel   = $kernel;
    }

    /**
     * @param GetResponseForExceptionEvent $event
     * @author Dmytro Feshchenko <dimafe2000@gmail.com>
     */
    public function onKernelException(GetResponseForExceptionEvent $event)
    {
        $exception = $event->getException();
        $request   = $event->getRequest();

        if ($request->isXmlHttpRequest() || in_array('application/json', $request->getAcceptableContentTypes())) {
            if ($exception instanceof AuthenticationException) {
                $location = $this->kernel->getContainer()->get('router')
                    ->generate('admin_dashboard', [], UrlGeneratorInterface::ABSOLUTE_URL);
                $event->setResponse(new JsonResponse('', Response::HTTP_FOUND, [
                    'X-Location' => $location,
                ]));

                return;
            } else {
                $code = Response::HTTP_INTERNAL_SERVER_ERROR;

                if ($exception instanceof HttpExceptionInterface) {
                    $code = $exception->getStatusCode();
                } else {
                    $code = intval($exception->getCode()) > 0 ?
                        $exception->getCode() :
                        Response::HTTP_INTERNAL_SERVER_ERROR;
                }

                $data = ['code' => $code, 'message' => $exception->getMessage()];

                if ($this->kernel->isDebug()) {
                    $data['trace'] = $exception->getTrace();
                }

                $event->setResponse(new JsonResponse($data, $code));
            }
        }

        if ($this->kernel->isDebug() && 0) {
            $message = sprintf(
                '%s with code: %s\r\nFile: %s\r\nLine:%s',
                $exception->getMessage(),
                $exception->getCode(),
                $exception->getFile(),
                $exception->getLine()
            );

            // Customize your response object to display the exception details
            $response = new Response();
            $response->setContent($message);

            // HttpExceptionInterface is a special type of exception that
            // holds status code and header details
            if ($exception instanceof HttpExceptionInterface) {
                $response->setStatusCode($exception->getStatusCode());
                $response->headers->replace($exception->getHeaders());
            } else {
                $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            // Send the modified response object to the event
            $event->setResponse($response);
        }
    }
}
