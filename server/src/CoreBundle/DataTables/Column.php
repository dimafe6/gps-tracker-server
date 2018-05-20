<?php

namespace CoreBundle\DataTables;

/**
 * Class Column
 *
 * @category PHP
 * @package  CoreBundle\DataTables
 * @author   Dmytro Feshchenko <dimafe2000@gmail.com>
 */
class Column extends \Intracto\DataTables\Column
{
    /**
     * @var string
     */
    protected $defaultValue = '';
    /**
     * @var string
     */
    private $type;
    /**
     * @var array
     */
    private $options;

    /** @var boolean $byReference */
    private $byReference;

    /**
     * Column constructor
     *
     * @param string $name
     * @param string $dbField
     * @param string $default
     * @param bool $searchable
     * @param bool $orderable
     * @param string $type
     * @param array $options
     * @param bool $byReference
     */
    public function __construct(
        $name,
        $dbField,
        $default = '',
        $searchable = false,
        $orderable = false,
        $type = 'string',
        $options = [],
        $byReference = false
    ) {
        parent::__construct($name, $dbField, $searchable, $orderable);

        $this->defaultValue = $default;
        $this->type         = $type;
        $this->options      = $options;
        $this->byReference  = $byReference;
    }

    /**
     * @return string
     */
    public function getDefaultValue()
    {
        return $this->defaultValue;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @return array
     * @author Oleg Davydyuk <ilveann@gmail.gov.ua>
     */
    public function getOptions()
    {
        return $this->options;
    }

    /**
     * @param array $options
     * @author Dmytro Feshchenko <dimafe2000@gmail.com>
     */
    public function setOptions(array $options)
    {
        $this->options = $options;
    }


    /**
     * @return bool
     */
    public function isByReference()
    {
        return $this->byReference;
    }
}
