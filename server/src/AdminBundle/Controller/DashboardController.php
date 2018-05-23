<?php

namespace AdminBundle\Controller;

use AdminBundle\Form\SettingsType;
use CoreBundle\Controller\BaseController;
use DeviceBundle\Document\Setting;
use Symfony\Component\HttpFoundation\Request;

class DashboardController extends BaseController
{
    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction(Request $request)
    {
        return $this->render('@Admin/dashboard/index.html.twig', [
        ]);
    }
}
