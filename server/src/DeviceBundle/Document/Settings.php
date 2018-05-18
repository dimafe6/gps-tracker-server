<?php

namespace DeviceBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * @MongoDB\Document(repositoryClass="DeviceBundle\Repository\SettingsRepository")
 */
class Settings
{
    /**
     * @MongoDB\Id(strategy="auto")
     */
    protected $id;
}
