<?php
/**
 * Created by PhpStorm.
 * User: dima
 * Date: 20.05.18
 * Time: 23:58
 */

namespace DeviceBundle\Document\Command;

use DeviceBundle\Document\Command\CommandResponse\CommandResponseInterface;

interface CommandInterface
{
    const STATUS_NEW = 'STATUS_NEW';
    const STATUS_PROCESSING = 'STATUS_PROCESSING';
    const STATUS_COMPLETE = 'STATUS_COMPLETE';

    /**
     * @return string
     */
    public function getId();

    /**
     * @return string
     */
    public function getCommand();

    /**
     * @param string $command
     * @return self
     */
    public function setCommand($command);

    /**
     * @return string
     */
    public function getCommandName();

    /**
     * @param string $commandName
     * @return self
     */
    public function setCommandName($commandName);

    /**
     * @return mixed
     */
    public function getData();

    /**
     * @param mixed $data
     * @return self
     */
    public function setData($data);

    /**
     * @return string
     */
    public function getStatus();

    /**
     * @param string $status
     * @return self
     */
    public function setStatus($status);

    /**
     * @return string
     */
    public function getResult();

    /**
     * @param CommandResponseInterface $result
     * @return self
     */
    public function setResult(CommandResponseInterface $result);

    /**
     * @return \DateTime
     */
    public function getCreated();

    /**
     * @param \DateTime $created
     * @return self
     */
    public function setCreated($created);
}