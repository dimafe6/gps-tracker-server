<?php

namespace CoreBundle\Form;

use Symfony\Component\Form\AbstractType as BaseType;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class AbstractType
 *
 * @category PHP
 * @package  CoreBundle\Form
 * @author   Dmytro Feshchenko <dimafe2000@gmail.com>
 */
class AbstractType extends BaseType
{
    /**
     * @var string
     */
    protected $translationDomain;

    /**
     * @var string
     */
    protected $formPrefix;

    /**
     * AbstractType constructor.
     */
    public function __construct()
    {
        $this->formPrefix        = (new \ReflectionClass($this))->getShortName();
        $namespace               = (new \ReflectionClass($this))->getNamespaceName();
        $this->translationDomain = substr($namespace, 0, strpos($namespace, '\\'));
    }

    /**
     * @return string
     */
    public function getTranslationDomain()
    {
        return $this->translationDomain;
    }

    /**
     * @return string
     */
    public function getFormPrefix()
    {
        return $this->formPrefix;
    }

    /**
     * @param OptionsResolver $resolver
     * @author Dmytro Feshchenko <dimafe2000@gmail.com>
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'translation_domain' => $this->translationDomain,
            'label_format'       => "$this->formPrefix.%name%.name",
        ]);
    }
}
