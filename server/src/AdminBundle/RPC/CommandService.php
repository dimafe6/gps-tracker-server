<?php

namespace AdminBundle\RPC;

use AdminBundle\Form\Command\Data\StartNewTrackCommandType;
use CoreBundle\Service\AbstractControllerService;
use DeviceBundle\Document\Command\Command;
use DeviceBundle\Document\Command\CommandData\StartNewTrackData;
use DeviceBundle\Service\CommandService as DeviceCommands;
use Doctrine\ODM\MongoDB\MongoDBException;
use Gos\Bundle\WebSocketBundle\Router\WampRequest;
use Gos\Bundle\WebSocketBundle\RPC\RpcInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\WampConnection;
use Symfony\Component\HttpFoundation\Response;

class CommandService extends AbstractControllerService implements RpcInterface
{
    /** @var DeviceCommands $commandService */
    private $commandService;

    public function __construct(DeviceCommands $commandService)
    {
        $this->commandService = $commandService;
    }

    /**
     * Adds the params together
     *
     * Note: $conn isnt used here, but contains the connection of the person making this request.
     *
     * @param WampConnection $connection
     * @param WampRequest $request
     * @param array $params
     * @return string
     */
    public function startNewTrack(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $data = new StartNewTrackData();

        $form = $this->createForm(StartNewTrackCommandType::class, $data);
        $form->submit($params);

        if ($form->isValid()) {
            try {
                $command = $this->commandService->createCommand(
                    'Start new track',
                    Command::COMMAND_START_NEW_TRACK,
                    $data
                );

                $commandJson = $this->serializedJsonResponse($command, 'DEVICE_COMMAND')->getContent();

                $connection->event('device', $commandJson);
            } catch (MongoDBException $e) {
                return $this->createJsonResponse(Response::HTTP_BAD_REQUEST)->getContent();
            }

            return $this->createSuccessJsonResponse()->getContent();
        }

        return $this->createJsonResponse(Response::HTTP_BAD_REQUEST, $this->getFormErrors($form))->getContent();
    }

    /**
     * Name of RPC, use for pubsub router (see step3)
     *
     * @return string
     */
    public function getName()
    {
        return 'commands.rpc';
    }
}