<?php
/**
 * Created by PhpStorm.
 * User: dima
 * Date: 20.05.18
 * Time: 1:43
 */

namespace DeviceBundle\Service;

use CoreBundle\Service\AbstractService;
use DeviceBundle\Document\Command\CommandInterface;
use DeviceBundle\Document\Command\CommandResponse\CommandResponseInterface;
use DeviceBundle\Repository\CommandRepository;
use JMS\Serializer\Serializer;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Class CommandService
 * @package DeviceBundle\Service
 */
class CommandService extends AbstractService
{
    /** @var Serializer */
    protected $serializer;

    /**
     * @param Serializer $serializer
     */
    public function setSerializer(Serializer $serializer)
    {
        $this->serializer = $serializer;
    }

    /**
     * @return CommandRepository
     */
    private function getRepository()
    {
        return $this->dm->getRepository('DeviceBundle:Command\Command');
    }

    /**
     * @param CommandInterface $command
     * @throws \Doctrine\ODM\MongoDB\MongoDBException
     */
    public function createCommand(CommandInterface $command)
    {
        $qb = $this->getRepository()->createQueryBuilder();
        $qb
            ->field('command')->equals($command->getCommand())
            ->remove()
            ->getQuery()
            ->execute();

        $this->saveDocument($command);
    }

    /**
     * Get one older command
     * @return CommandInterface|null
     */
    public function getCommand()
    {
        $qb      = $this->getRepository()->createQueryBuilder();
        $command = $qb
            ->field('status')->equals(CommandInterface::STATUS_NEW)
            ->sort('created', 1)
            ->getQuery()
            ->getSingleResult();

        return $command;
    }

    /**
     * @param $id
     * @param bool $throw
     * @return CommandInterface|null
     */
    public function getCommandById($id, $throw = true)
    {
        $command = $this->getRepository()->findOneBy([
            'id' => new \MongoId($id),
        ]);

        if (null === $command && $throw) {
            throw new NotFoundHttpException('Command not found');
        }

        return $command;
    }

    /**
     * @param Request $request
     * @param CommandInterface $command
     */
    private function processCommandResult(Request $request, CommandInterface &$command)
    {
        $requestObject = json_decode($request->getContent(), true);

        if (isset($requestObject['type']) && isset($requestObject['data'])) {
            $type = CommandResponseInterface::class;
            $type = str_replace('CommandResponseInterface', $requestObject['type'], $type);
            $data = json_encode($requestObject['data']);

            $object = $this->serializer->deserialize($data, $type, 'json');

            $command->setResult($object);
        }
    }

    /**
     * @param Request $request
     * @param CommandInterface $command
     */
    public function completeCommand(Request $request, CommandInterface &$command)
    {
        if ($command->getStatus() !== CommandInterface::STATUS_PROCESSING) {
            return;
        }

        $this->processCommandResult($request, $command);

        $command->setStatus(CommandInterface::STATUS_COMPLETE);

        $this->saveDocument($command);
    }

    /**
     * @param CommandInterface $command
     */
    public function startCommand(CommandInterface $command)
    {
        if ($command->getStatus() !== CommandInterface::STATUS_NEW) {
            return;
        }

        $command->setStatus(CommandInterface::STATUS_PROCESSING);

        $this->saveDocument($command);
    }
}