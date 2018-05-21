<?php
/**
 * Created by PhpStorm.
 * User: dima
 * Date: 20.05.18
 * Time: 16:53
 */

namespace AdminBundle\Form;

use CoreBundle\Form\AbstractType;
use CoreBundle\Form\Type\SpanType;
use DeviceBundle\Document\Setting;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class SettingType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', SpanType::class, [
                'label' => false,
                'attr' => ['readonly' => true]
            ])
            ->add('value', TextType::class, [
                'label' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        parent::configureOptions($resolver);

        $resolver->setDefaults([
            'label'      => false,
            'data_class' => Setting::class,
        ]);
    }
}