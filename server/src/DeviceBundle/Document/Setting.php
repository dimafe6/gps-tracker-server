<?php

namespace DeviceBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * @MongoDB\Document(repositoryClass="DeviceBundle\Repository\SettingRepository")
 */
class Setting
{
    const SLEEP_TYPE_MANUAL = "MANUAL";
    const SLEEP_TYPE_AUTO = "AUTO";

    /**
     * @MongoDB\Id(strategy="auto")
     */
    protected $id;

    /**
     * @MongoDB\Field(type="string")
     * @MongoDB\Index(unique=true, order="asc")
     */
    protected $name;

    /**
     * @MongoDB\Field(type="raw")
     */
    protected $value;

    /**
     * @MongoDB\Field(type="boolean")
     */
    protected $needUpdateOnDevice;

    /**
     * @MongoDB\Field(type="boolean")
     * @var boolean
     */
    protected $editable;

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
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     * @return self
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * @param mixed $value
     * @return self
     */
    public function setValue($value)
    {
        $this->value = $value;

        return $this;
    }

    /**
     * @return boolean
     */
    public function isNeedUpdateOnDevice()
    {
        return $this->needUpdateOnDevice;
    }

    /**
     * @param boolean $needUpdateOnDevice
     * @return Setting
     */
    public function setNeedUpdateOnDevice($needUpdateOnDevice)
    {
        $this->needUpdateOnDevice = $needUpdateOnDevice;

        return $this;
    }

    /**
     * @return bool
     */
    public function isEditable()
    {
        return $this->editable;
    }

    /**
     * @param bool $editable
     * @return Setting
     */
    public function setEditable($editable)
    {
        $this->editable = $editable;

        return $this;
    }


}
