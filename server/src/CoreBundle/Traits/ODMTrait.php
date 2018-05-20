<?php

namespace CoreBundle\Traits;

use Doctrine\ODM\MongoDB\DocumentManager;

/**
 * Trait ODMTrait
 * @package CoreBundle\Traits
 * @author Dmytro Feshchenko <dimafe2000@gmail.com>
 */
trait ODMTrait
{
    /** @var DocumentManager */
    protected $dm;

    /**
     * @param DocumentManager $documentManager
     */
    public function setDocumentManager(DocumentManager $documentManager)
    {
        $this->dm = $documentManager;
    }
}
