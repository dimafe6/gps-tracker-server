<?php
/**
 * Created by PhpStorm.
 * User: dima
 * Date: 20.05.18
 * Time: 22:51
 */

namespace DeviceBundle\Document\Command\CommandData;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * @MongoDB\EmbeddedDocument()
 */
class StartNewTrackData
{
    /**
     * @MongoDB\Field(type="string")
     * @var string
     */
    protected $trackName;

    /**
     * @return string
     */
    public function getTrackName()
    {
        return $this->trackName;
    }

    /**
     * @param string $trackName
     * @return self
     */
    public function setTrackName($trackName)
    {
        $this->trackName = $trackName;

        return $this;
    }


}