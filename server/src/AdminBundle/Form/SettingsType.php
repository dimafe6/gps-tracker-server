<?php
/**
 * Created by PhpStorm.
 * User: dima
 * Date: 20.05.18
 * Time: 16:53
 */

namespace AdminBundle\Form;

use CoreBundle\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;

class SettingsType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('settings', CollectionType::class, [
                'label'        => false,
                'entry_type'   => SettingType::class,
                'allow_add'    => true,
                'allow_delete' => true,
            ]);
    }
}