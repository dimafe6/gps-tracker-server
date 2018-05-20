<?php
/**
 * Created by PhpStorm.
 * User: dima
 * Date: 21.05.18
 * Time: 0:12
 */

namespace AdminBundle\Controller;

use AdminBundle\Form\Command\StartNewTrackCommandType;
use CoreBundle\Controller\BaseController;
use DeviceBundle\Document\Command\Command;
use Doctrine\ODM\MongoDB\MongoDBException;
use Symfony\Component\Form\FormError;
use Symfony\Component\HttpFoundation\Request;

class CommandController extends BaseController
{
    public function startNewTrackAction(Request $request)
    {
        $commandService = $this->get('device.service.command_service');

        $command = new Command();
        $command
            ->setCommand(Command::COMMAND_START_NEW_TRACK)
            ->setCommandName('Start new track');

        $form = $this->createForm(StartNewTrackCommandType::class, $command, [
            'action' => $this->generateUrl('command_start_new_track'),
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            try {
                $commandService->createCommand($command);
            } catch (MongoDBException $e) {
                $form->get('data')->addError(
                    new FormError($e->getMessage())
                );
            }
        }

        return $this->render('@Admin/command/command_create_new_track.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}