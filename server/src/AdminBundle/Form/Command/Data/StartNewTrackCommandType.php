<?php
/**
 * Created by PhpStorm.
 * User: dima
 * Date: 20.05.18
 * Time: 16:53
 */

namespace AdminBundle\Form\Command\Data;

use CoreBundle\Form\AbstractType;
use DeviceBundle\Document\Command\CommandData\StartNewTrackData;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class StartNewTrackCommandType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('trackName', TextType::class, [
            'label' => 'Track name'
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        parent::configureOptions($resolver);

        $resolver->setDefaults([
            'label'      => false,
            'data_class' => StartNewTrackData::class,
            'csrf_protection' => false
        ]);
    }
}