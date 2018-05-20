<?php

namespace CoreBundle\DataTables;

use Intracto\DataTables\ColumnTransformerInterface;
use Intracto\DataTables\Parameters;

/**
 * Get data for DataTables AJAX calls
 */
class DataProvider
{
    /**
     * @param Parameters $parameters
     * @param Columns $columns
     * @param DataTablesRepositoryInterface $dataTablesRepository
     * @param ColumnTransformerInterface $columnTransformer
     *
     * @return array
     */
    public function getData(
        Parameters $parameters,
        Columns $columns,
        DataTablesRepositoryInterface $dataTablesRepository,
        ColumnTransformerInterface $columnTransformer
    ) {
        $data = array(
            'draw' => $parameters->getDraw(),
            'recordsTotal' => $dataTablesRepository->getDataTablesTotalRecordsCount($parameters, $columns),
            'recordsFiltered' => $dataTablesRepository->getDataTablesFilteredRecordsCount($parameters, $columns),
            'data' => $this->getColumns($parameters, $columns, $dataTablesRepository, $columnTransformer),
        );

        return $data;
    }

    /**
     * @param Parameters $parameters
     * @param Columns $columns
     * @param DataTablesRepositoryInterface $dataTablesRepository
     * @param ColumnTransformerInterface $columnTransformer
     *
     * @return array
     */
    private function getColumns(
        Parameters $parameters,
        Columns $columns,
        DataTablesRepositoryInterface $dataTablesRepository,
        ColumnTransformerInterface $columnTransformer
    ) {
        $data = $dataTablesRepository->getDataTablesData($parameters, $columns);
        $columnsData = $columnTransformer->transform($data);

        return $columnsData;
    }
}
