<?php

namespace CoreBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class DivType
 *
 * @category PHP
 * @package  CoreBundle\Form\Type
 * @author   Dmytro Feshchenko <dimafe2000@gmail.com>
 */
class DivType extends AbstractType
{
    /**
     * @param OptionsResolver $resolver
     * @author Dmytro Feshchenko <dimafe2000@gmail.com>
     */
    public function setDefaultOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'mapped' => false
        ));
    }

    /**
     * @return  string
     */
    public function getName()
    {
        return 'div';
    }

    /**
     * @return  string
     */
    public function getParent()
    {
        return 'Symfony\Component\Form\Extension\Core\Type\TextType';
    }
}
