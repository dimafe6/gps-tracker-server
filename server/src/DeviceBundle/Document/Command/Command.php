<?php
/**
 * Created by PhpStorm.
 * User: dima
 * Date: 20.05.18
 * Time: 22:51
 */

namespace DeviceBundle\Document\Command;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * @MongoDB\Document(collection="Command", repositoryClass="DeviceBundle\Repository\CommandRepository")
 */
class Command extends AbstractCommand
{
    const COMMAND_START_NEW_TRACK = 'COMMAND_START_NEW_TRACK';
}