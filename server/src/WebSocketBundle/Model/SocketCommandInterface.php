<?php

namespace WebSocketBundle\Model;

/**
 * Interface SocketCommandInterface
 * @package WebSocketBundle\Model
 * @author Dmytro Feshchenko <dimafe2000@gmail.com>
 */
interface SocketCommandInterface
{
    /**
     * @return string
     */
    public function getName();

    /**
     * @param $name
     * @return self
     */
    public function setName($name);

    /**
     * @return string
     */
    public function getType();

    /**
     * @param $type
     * @return self
     */
    public function setType($type);

    /**
     * @return mixed
     */
    public function getData();

    /**
     * @param $data
     * @return self
     */
    public function setData($data);
}
