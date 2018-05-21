<?php
/**
 * Created by PhpStorm.
 * User: dima
 * Date: 20.05.18
 * Time: 16:53
 */

namespace AdminBundle\Form;

use CoreBundle\Form\AbstractType;
use DeviceBundle\Document\Setting;
use Symfony\Component\Form\CallbackTransformer;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\FormBuilderInterface;

class SettingsType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('gpsSearchTime', NumberType::class, [
                'label' => 'GPS search time(millis)'
            ])
            ->add('sleepTime', NumberType::class, [
                'label' => 'Sleep time(millis)',
            ])
            ->add('wifiConnectionTimeout', NumberType::class, [
                'label' => 'WiFi connection timeout(millis)',
            ])
            ->add('wifiConnectionRetries', NumberType::class, [
                'label' => 'WiFi connection retries(millis)',
            ])
            ->add('frequencyWaypoints', NumberType::class, [
                'label' => 'Frequency waypoint(meters)',
            ])
            ->add('sleepType', ChoiceType::class, [
                'label'   => 'Sleep type',
                'choices' => [
                    'Manual' => Setting::SLEEP_TYPE_MANUAL,
                    'Auto'   => Setting::SLEEP_TYPE_AUTO,
                ],
                'attr'    => [
                    'class' => 'select-styled',
                ],
            ]);

        $builder->get('sleepTime')->addModelTransformer(new CallbackTransformer(
            function ($value) {
                return $value / 1000; //To milliseconds
            },
            function ($value) {
                return $value * 1000; //To microseconds
            }
        ));
    }
}