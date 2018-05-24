<?php

namespace WebSocketBundle\Topic;

use Gos\Bundle\WebSocketBundle\Router\WampRequest;
use Gos\Bundle\WebSocketBundle\Topic\TopicInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\Topic;
use Ratchet\Wamp\WampConnection;

class DeviceTopic implements TopicInterface
{
    /**
     * This will receive any Subscription requests for this topic.
     *
     * @param WampConnection $connection
     * @param Topic $topic
     * @param WampRequest $request
     * @return void
     */
    public function onSubscribe(ConnectionInterface $connection, Topic $topic, WampRequest $request)
    {
        $connection->event('client', ['msg' => 'Device connected']);
    }

    /**
     * This will receive any UnSubscription requests for this topic.
     *
     * @param WampConnection $connection
     * @param Topic $topic
     * @param WampRequest $request
     * @return void
     */
    public function onUnSubscribe(ConnectionInterface $connection, Topic $topic, WampRequest $request)
    {
        $connection->event('client', ['msg' => 'Device disconnected']);
    }


    /**
     * This will receive any Publish requests for this topic.
     *
     * @param WampConnection $connection
     * @param Topic $topic
     * @param WampRequest $request
     * @param $event
     * @param array $exclude
     * @param array $eligible
     * @return mixed|void
     */
    public function onPublish(
        ConnectionInterface $connection,
        Topic $topic,
        WampRequest $request,
        $event,
        array $exclude,
        array $eligible
    ) {
        $connection->event('client', ['msg' => $event]);
    }

    /**
     * Like RPC is will use to prefix the channel
     * @return string
     */
    public function getName()
    {
        return 'device.topic';
    }
}