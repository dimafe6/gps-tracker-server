<?php

namespace CoreBundle\DataTables;

/**
 * Class Columns
 *
 * @category PHP
 * @package  CoreBundle\DataTables
 * @author   Dmytro Feshchenko <dimafe2000@gmail.com>
 */
class Columns extends \Intracto\DataTables\Columns
{
    /**
     * @var array|\Intracto\DataTables\Column[]
     */
    protected $columns;

    /**
     * @var array
     */
    protected $searchableFields = [];

    /**
     * @inheritDoc
     */
    public function __construct($columns)
    {
        parent::__construct($columns);
        $this->columns = $columns;
    }

    /**
     * @return array
     */
    public function getSearchableFields()
    {
        $searchable = [];

        /** @var Column $column */
        foreach ($this->columns as $column) {
            if ($column->isSearchable()) {
                $searchable[] =
                    isset($this->searchableFields[$column->getDbField()]) ?
                        $this->searchableFields[$column->getDbField()] :
                        $column->getDbField();
            }
        }

        return $searchable;
    }

    /**
     * @param $column
     * @return Column|null
     * @author Dmytro Feshchenko <dimafe2000@gmail.com>
     */
    public function columnGet($column)
    {
        $col = null;
        array_walk($this->columns, function (Column $item) use ($column, &$col) {
            if ($item->getDbField() == $column) {
                $col = $item;
            }
        });

        return $col;
    }
}
