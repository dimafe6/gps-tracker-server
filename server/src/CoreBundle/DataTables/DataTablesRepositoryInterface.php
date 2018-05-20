<?php

namespace CoreBundle\DataTables;

use Intracto\DataTables\Parameters;

/**
 * Defines the public API of a DataTablesRepository
 */
interface DataTablesRepositoryInterface
{
    /**
     * @var string
     */
    const ENTITY_ALIAS = 'x';

    /**
     * @param Parameters $parameters
     * @param Columns $columns
     *
     * @return int
     */
    public function getDataTablesTotalRecordsCount(Parameters $parameters, Columns $columns);

    /**
     * @param Parameters $parameters
     * @param Columns $columns
     *
     * @return int
     */
    public function getDataTablesFilteredRecordsCount(Parameters $parameters, Columns $columns);

    /**
     * @param Parameters $parameters
     * @param Columns $columns
     *
     * @return array
     */
    public function getDataTablesData(Parameters $parameters, Columns $columns);
}
