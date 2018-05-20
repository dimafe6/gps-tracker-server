<?php

namespace CoreBundle\Service;

use CoreBundle\Traits\ControllerTrait;

/**
 * Class AbstractControllerService
 *
 * @category PHP
 * @package  CoreBundle\Service
 * @author   Dmytro Feshchenko <dimafe2000@gmail.com>
 */
abstract class AbstractControllerService extends AbstractService
{
    use ControllerTrait;
}
