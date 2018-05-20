<?php
/**
 * Created by PhpStorm.
 * User: dima
 * Date: 20.05.18
 * Time: 22:51
 */

namespace DeviceBundle\Document\Command;

use DeviceBundle\Document\Command\CommandResponse\CommandResponseInterface;
use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * @MongoDB\MappedSuperclass()
 */
abstract class AbstractCommand implements CommandInterface
{
    /**
     * @MongoDB\Id(type="auto")
     * @var string
     */
    protected $id;

    /**
     * @MongoDB\Field(type="string")
     * @var string
     */
    protected $command;

    /**
     * @MongoDB\Field(type="string")
     * @var string
     */
    protected $commandName;

    /**
     * @MongoDB\EmbedOne(discriminatorField="type")
     * @var mixed
     */
    protected $data;

    /**
     * @MongoDB\Field(type="string")
     * @var string
     */
    protected $status;

    /**
     * @MongoDB\EmbedOne(discriminatorField="type")
     * @var mixed
     */
    protected $result;

    /**
     * @MongoDB\Field(type="date")
     * @var \DateTime
     */
    protected $created;

    /**
     * AbstractCommand constructor.
     */
    public function __construct()
    {
        $this->created = new \DateTime();
        $this->status = CommandInterface::STATUS_NEW;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getCommand()
    {
        return $this->command;
    }

    /**
     * @param string $command
     * @return self
     */
    public function setCommand($command)
    {
        $this->command = $command;

        return $this;
    }

    /**
     * @return string
     */
    public function getCommandName()
    {
        return $this->commandName;
    }

    /**
     * @param string $commandName
     * @return self
     */
    public function setCommandName($commandName)
    {
        $this->commandName = $commandName;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * @param mixed $data
     * @return self
     */
    public function setData($data)
    {
        $this->data = $data;

        return $this;
    }

    /**
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @param string $status
     * @return self
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * @return CommandResponseInterface
     */
    public function getResult()
    {
        return $this->result;
    }

    /**
     * @param CommandResponseInterface $result
     * @return self
     */
    public function setResult(CommandResponseInterface $result)
    {
        $this->result = $result;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @param \DateTime $created
     * @return self
     */
    public function setCreated($created)
    {
        $this->created = $created;

        return $this;
    }
}