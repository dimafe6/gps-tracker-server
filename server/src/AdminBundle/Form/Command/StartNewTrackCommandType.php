<?php
/**
 * Created by PhpStorm.
 * User: dima
 * Date: 20.05.18
 * Time: 16:53
 */

namespace AdminBundle\Form\Command;

use AdminBundle\Form\Command\Data\StartNewTrackCommandDataType;
use CoreBundle\Form\AbstractType;
use DeviceBundle\Document\Command\Command;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class StartNewTrackCommandType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('data', StartNewTrackCommandDataType::class, [
                'label' => false
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        parent::configureOptions($resolver);

        $resolver->setDefaults([
            'label'      => false,
            'data_class' => Command::class,
        ]);
    }
}