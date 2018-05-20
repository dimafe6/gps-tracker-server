<?php

namespace DeviceBundle\Repository;

use DeviceBundle\Document\Setting;
use Doctrine\ODM\MongoDB\DocumentRepository;

/**
 * Class SettingRepository
 *
 * @category PHP
 * @package  DeviceBundle\Repository
 * @author   Dmytro Feshchenko <dimafe2000@gmail.com>
 */
class SettingRepository extends DocumentRepository
{
    /**
     * @param $name
     * @return Setting|null
     */
    public function getSettingByName($name)
    {
        $setting = $this->findOneBy(['name' => $name]);

        return $setting;
    }

    /**
     * @return Setting[]|null
     */
    public function getSettingsForEdit()
    {
        return $this->findBy(['editable' => true]);
    }

    /**
     * @return Setting[]|null
     */
    public function getSettingsForDevice()
    {
        return $this->findBy(['needUpdateOnDevice' => true]);
    }
}
