<?php

namespace CoreBundle\Traits;

use CoreBundle\DataTables\Columns;
use CoreBundle\DataTables\DataProvider;
use CoreBundle\DataTables\DataTablesRepositoryInterface;
use Intracto\DataTables\ColumnTransformerInterface;
use Intracto\DataTables\Parameters;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Trait DataTablesTrait
 * @package CoreBundle\Traits
 * @author Dmytro Feshchenko <dimafe2000@gmail.com>
 */
trait DataTablesTrait
{
    /**
     * @param Parameters $parameters
     * @param Columns $columns
     * @param DataTablesRepositoryInterface $repository
     * @param ColumnTransformerInterface $transformer
     * @return JsonResponse
     * @author Dmytro Feshchenko <dimafe2000@gmail.com>
     */
    protected function getAjaxData(
        Parameters $parameters,
        Columns $columns,
        DataTablesRepositoryInterface $repository,
        ColumnTransformerInterface $transformer
    ) {
        $dataProvider = new DataProvider();

        $data = $dataProvider->getData(
            $parameters,
            $columns,
            $repository,
            $transformer
        );

        return new JsonResponse($data);
    }
}
