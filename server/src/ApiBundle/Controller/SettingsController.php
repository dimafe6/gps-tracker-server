<?php

namespace ApiBundle\Controller;

use CoreBundle\Controller\BaseController;
use CoreBundle\Traits\ApiTrait;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class SettingsController extends BaseController
{
    use ApiTrait;

    public function saveSettingsAction(Request $request)
    {
        $data = json_decode($request->getContent(), true);

        $this->get('device.service.setting_service')->saveSettingsFromDevice($data);

        return $this->createSuccessJsonResponse();
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function getSettingsAction(Request $request)
    {
        $settings = $this->get('device.service.setting_service')->getSettingsArrayForDevice();

        return new JsonResponse($settings);
    }
}
