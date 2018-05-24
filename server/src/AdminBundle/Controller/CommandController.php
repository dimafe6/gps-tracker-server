<?php
/**
 * Created by PhpStorm.
 * User: dima
 * Date: 21.05.18
 * Time: 0:12
 */

namespace AdminBundle\Controller;

use AdminBundle\Form\Command\Data\StartNewTrackCommandType;
use CoreBundle\Controller\BaseController;
use Symfony\Component\HttpFoundation\Request;

class CommandController extends BaseController
{
    public function indexAction(Request $request)
    {
        $startNewTrackForm = $this->createForm(StartNewTrackCommandType::class);

        return $this->render('@Admin/commands/index.html.twig', [
            'startNewTrackForm' => $startNewTrackForm->createView()
        ]);
    }
}