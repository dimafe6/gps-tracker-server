<?php

namespace CoreBundle\Traits;

use CoreBundle\DataTables\Column;
use CoreBundle\DataTables\Columns;
use Doctrine\ODM\MongoDB\Query\Builder;
use Intracto\DataTables\Parameters;

/**
 * Trait DataTablesRepositoryTrait
 * @package CoreBundle\Traits
 * @author Dmytro Feshchenko <dimafe2000@gmail.com>
 */
trait DataTablesRepositoryTrait
{
    /**
     * {@inheritdoc}
     */
    public function getDataTablesTotalRecordsCount(Parameters $parameters, Columns $columns)
    {
        return $this->createQueryBuilder()->getQuery()->execute()->count();
    }

    /**
     * {@inheritdoc}
     */
    public function getDataTablesFilteredRecordsCount(Parameters $parameters, Columns $columns)
    {
        return $this->getFilteredDataTablesQb($parameters, $columns)->getQuery()->execute()->count();
    }

    /**
     * @param Parameters $parameters
     * @param Columns $columns
     *
     * @return Builder
     */
    private function getFilteredDataTablesQb(Parameters $parameters, Columns $columns)
    {
        $qb = $this->createQueryBuilder();

        $this->addFilters($parameters, $qb, $columns);

        $this->addSearch($parameters, $columns, $qb);

        return $qb;
    }

    /**
     * @param Parameters $parameters
     * @param Builder $qb
     *
     * @param Columns $columns
     * @return void
     */
    protected function addFilters(Parameters $parameters, Builder &$qb, Columns $columns)
    {
        if ($parameters->hasFilters() === false) {
            return;
        }

        foreach ($parameters->getFilters() as $field => $value) {
            /** @var Column $col */
            $col     = $columns->columnGet($field);
            $colType = $col ? $col->getType() : 'string';

            if (is_callable($value)) {
                $value($qb);
            } elseif ($colType == 'select') {
                if (is_array($value)) {
                    $qb->field($field)->in(array_values($value));
                }
            } elseif ($colType == 'select_id') {
                if (is_array($value)) {
                    $ids = array_map(function ($val) {
                        return new \MongoId($val);
                    }, $value);

                    $qb->field($field)->in($ids);
                }
            } elseif (is_bool($value)) {
                $qb->field($field)->equals($value);
            } elseif ($colType == 'integer') {
                $qb->field($field)->equals(intval($value));
            } elseif ($colType == 'float') {
                $qb->field($field)->equals(floatval($value));
            } elseif ($colType == 'reference') {
                //Must be implemented in concrete repository
            } else {
                if (is_string($value) && !empty($value)) {
                    $qb->field($field)->equals(new \MongoRegex(sprintf('/%s/i', $value)));
                }
            }
        }
    }

    /**
     * @param Parameters $parameters
     * @param Columns $columns
     * @param Builder $qb
     *
     * @return void
     */
    private function addSearch(Parameters $parameters, Columns $columns, Builder $qb)
    {
        if ($parameters->hasSearchString() === false) {
            return;
        }

        $searchString = $parameters->getSearchString();

        $expression = $qb->expr();

        foreach ($columns->getSearchableFields() as $field) {
            $searchExpr = $qb->expr()->field($field)->equals(new \MongoRegex(sprintf('/%s/i', $searchString)));
            $expression->addOr($searchExpr);
        }

        $qb->addAnd($expression);
    }

    /**
     * {@inheritdoc}
     */
    public function getDataTablesData(Parameters $parameters, Columns $columns)
    {
        $qb = $this->getFilteredDataTablesQb($parameters, $columns);
        $qb->limit($parameters->getLength())->skip($parameters->getStart());

        if ($parameters->getOrderField() !== null) {
            $qb->sort(
                $parameters->getOrderField(),
                strtolower($parameters->getOrderDirection()) === Parameters::ORDER_DIRECTION_ASC ? 1 : -1
            );
        }

        return $qb->getQuery()->execute()->toArray(false);
    }
}
