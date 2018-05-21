<?php

namespace AdminBundle\Controller;

use AdminBundle\Form\SettingsType;
use CoreBundle\Controller\BaseController;
use DeviceBundle\Document\Setting;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class SettingsController
 * @package AdminBundle\Controller
 */
class SettingsController extends BaseController
{
    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction(Request $request)
    {
        $settingService = $this->get('device.service.setting_service');

        $form = $this->createForm(SettingsType::class, null, [
            'action' => $this->generateUrl('admin_settings_page'),
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $settingService->saveSettingsFromAdmin($form->getData());

            $this->createSuccessJsonResponse();
        } else {
            $settingsObjects = $settingService->getSettingsForEdit();
            $settings        = [];
            /** @var Setting $setting */
            foreach ($settingsObjects as $setting) {
                $settings[$setting->getName()] = $setting->getValue();
            }
            $form->setData($settings);
        }

        return $this->render('@Admin/settings/settings.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
