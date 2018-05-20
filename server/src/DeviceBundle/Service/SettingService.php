<?php
/**
 * Created by PhpStorm.
 * User: dima
 * Date: 20.05.18
 * Time: 1:43
 */

namespace DeviceBundle\Service;

use CoreBundle\Service\AbstractService;
use DeviceBundle\Document\Setting;

/**
 * Class SettingService
 * @package DeviceBundle\Service
 */
class SettingService extends AbstractService
{
    /**
     * @return \DeviceBundle\Repository\SettingRepository|\Doctrine\Common\Persistence\ObjectRepository
     */
    private function getRepository()
    {
        return $this->dm->getRepository('DeviceBundle:Setting');
    }

    /**
     * @return Setting[]
     */
    public function getSettingsForEdit()
    {
        $settings = $this->getRepository()->getSettingsForEdit();

        return $settings;
    }

    /**
     * @return \stdClass
     */
    public function getSettingsArrayForDevice()
    {
        $settings = $this->getRepository()->getSettingsForDevice();

        $response = new \stdClass();

        /** @var Setting $setting */
        foreach ($settings as $setting) {
            $response->{$setting->getName()} = $setting->getValue();
        }

        return $response;
    }

    /**
     * @param array $settings
     */
    public function saveSettingsFromDevice(array $settings)
    {
        foreach ($settings as $settingKey => $settingVal) {
            $setting = $this->getRepository()->getSettingByName($settingKey);

            if (null === $setting) {
                $setting = new Setting();
            }

            if ($setting->getValue() == $settingVal) {
                $setting->setNeedUpdateOnDevice(false);
            }

            if ($setting->isNeedUpdateOnDevice()) {
                continue;
            }

            $setting
                ->setName($settingKey)
                ->setValue($settingVal);

            $this->dm->persist($setting);
        }

        $this->dm->flush();
    }

    public function saveSettingsFromAdmin(array $settings)
    {
        foreach ($settings as $settingKey => $settingVal) {
            $setting = $this->getRepository()->getSettingByName($settingKey);

            if (null === $setting) {
                continue;
            }

            if ($setting->getValue() != $settingVal) {
                $setting
                    ->setNeedUpdateOnDevice(true);
            }

            switch (gettype($setting->getValue())) {
                case "double":
                    $settingVal = (double)$settingVal;
                    break;
                case "integer":
                    $settingVal = (integer)$settingVal;
                    break;
                case "string":
                    $settingVal = (string)$settingVal;
                    break;
            }

            $setting->setValue($settingVal);

            $this->dm->persist($setting);
        }

        $this->dm->flush();
    }

}