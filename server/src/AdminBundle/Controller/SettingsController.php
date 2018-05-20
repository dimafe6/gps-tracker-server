<?php

namespace AdminBundle\Controller;

use AdminBundle\Form\SettingsType;
use CoreBundle\Controller\BaseController;
use DeviceBundle\Document\Setting;
use Symfony\Component\HttpFoundation\Request;

class SettingsController extends BaseController
{
    public function indexAction(Request $request)
    {
        $settingService = $this->get('device.service.setting_service');

        $form = $this->createForm(SettingsType::class, null, [
            'action' => $this->generateUrl('settings_page'),
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $settingsObject = $form->get('settings')->getData();
            $settings       = [];
            /** @var Setting $setting */
            foreach ($settingsObject as $setting) {
                $settings[$setting->getName()] = $setting->getValue();
            }

            $settingService->saveSettingsFromAdmin($settings);
        } else {
            $settings = $settingService->getSettingsForEdit();
            $form->get('settings')->setData($settings);
        }

        return $this->render('@Admin/settings.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
