<?php

namespace ApiBundle\Controller;

use CoreBundle\Controller\BaseController;
use CoreBundle\Traits\ApiTrait;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class CommandController
 * @package ApiBundle\Controller
 */
class CommandController extends BaseController
{
    use ApiTrait;

    /**
     * @param Request $request
     * @return \FOS\RestBundle\View\View
     */
    public function getCommandAction(Request $request)
    {
        $commandService = $this->get('device.service.command_service');

        $command = $commandService->getCommand();

        return $this->createResponse($command, ['DEVICE_COMMAND']);
    }

    /**
     * @param Request $request
     * @param $id
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function startCommandAction(Request $request, $id)
    {
        $commandService = $this->get('device.service.command_service');
        $command        = $commandService->getCommandById($id);

        $commandService->startCommand($command);

        return $this->createSuccessJsonResponse();
    }

    /**
     * @param Request $request
     * @param $id
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function completeCommandAction(Request $request, $id)
    {
        $commandService = $this->get('device.service.command_service');
        $command        = $commandService->getCommandById($id);

        $commandService->completeCommand($request, $command);

        return $this->createSuccessJsonResponse();
    }
}
