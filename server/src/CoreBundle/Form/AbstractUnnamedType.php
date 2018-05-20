<?php

namespace CoreBundle\Form;

/**
 * Class AbstractUnnamedType
 *
 * @category PHP
 * @package  CoreBundle\Form
 * @author   Dmytro Feshchenko <dimafe2000@gmail.com>
 */
class AbstractUnnamedType extends AbstractType
{
    /**
     * @return string
     * @author Dmytro Feshchenko <dimafe2000@gmail.com>
     */
    public function getBlockPrefix()
    {
        return '';
    }
}
