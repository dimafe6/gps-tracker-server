<?php

namespace CoreBundle\Traits;

use Symfony\Component\EventDispatcher\Event;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

/**
 * Trait DispatcherTrait
 * @package CoreBundle\Traits
 * @author Dmytro Feshchenko <dimafe2000@gmail.com>
 */
trait DispatcherTrait
{
    /**
     * @var EventDispatcherInterface
     */
    protected $dispatcher;

    /**
     * @param EventDispatcherInterface $dispatcher
     */
    public function setDispatcher(EventDispatcherInterface $dispatcher)
    {
        $this->dispatcher = $dispatcher;
    }

    /**
     * @param $eventName
     * @param Event $event
     */
    public function dispatch($eventName, Event $event)
    {
        if (null !== $this->dispatcher) {
            $this->dispatcher->dispatch($eventName, $event);
        }
    }
}
