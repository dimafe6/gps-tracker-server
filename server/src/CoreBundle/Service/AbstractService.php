<?php

namespace CoreBundle\Service;

use CoreBundle\Traits\DispatcherTrait;
use CoreBundle\Traits\ODMTrait;

/**
 * Class AbstractService
 *
 * @category PHP
 * @package  CoreBundle\Service
 * @author   Dmytro Feshchenko <dimafe2000@gmail.com>
 */
abstract class AbstractService
{
    use DispatcherTrait;
    use ODMTrait;

    /**
     * @param $document
     * @author Oleg Davydyuk <ilveann@gmail.com>
     */
    public function saveDocument($document)
    {
        $this->dm->persist($document);
        $this->dm->flush();
    }

    /**
     * @param mixed $document
     * @param string $className
     * @return array
     * @author Dmytro Feshchenko <dimafe2000@gmail.com>
     */
    public function calculateChangeset($document, string $className)
    {
        $this->dm->persist($document);
        $this->dm->getUnitOfWork()
            ->recomputeSingleDocumentChangeSet($this->dm->getClassMetadata($className), $document);
        $changeset = $this->dm->getUnitOfWork()->getDocumentChangeSet($document);

        return $changeset;
    }
}
