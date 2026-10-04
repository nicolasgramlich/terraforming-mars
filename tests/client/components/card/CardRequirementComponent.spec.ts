import {shallowMount} from '@vue/test-utils';
import {globalConfig} from '../getLocalVue';
import {expect} from 'chai';
import CardRequirementComponent from '@/client/components/card/CardRequirementComponent.vue';
import {Tag} from '@/common/cards/Tag';
import {BoardName} from '@/common/boards/BoardName';

describe('CardRequirementComponent', () => {
  it('renders temperature requirement', () => {
    const wrapper = shallowMount(CardRequirementComponent, {
      ...globalConfig,
      props: {
        requirement: {temperature: -14, count: -14},
      },
    });
    expect(wrapper.text()).to.include('-14');
    expect(wrapper.find('.card-temperature--req').exists()).to.be.true;
  });

  it('renders tag requirement', () => {
    const wrapper = shallowMount(CardRequirementComponent, {
      ...globalConfig,
      props: {
        requirement: {tag: Tag.SCIENCE, count: 2},
      },
    });
    expect(wrapper.find('.tag-science').exists()).to.be.true;
  });

  it('renders an ocean requirement as printed outside a game and on standard maps', () => {
    for (const provide of [{}, {boardName: BoardName.THARSIS}]) {
      const wrapper = shallowMount(CardRequirementComponent, {
        ...globalConfig,
        global: {...globalConfig.global, provide},
        props: {
          requirement: {oceans: 5, count: 5},
        },
      });
      expect(wrapper.text()).to.include('5');
      expect(wrapper.findAll('.card-ocean--req')).has.length(1);
    }
  });

  it('doubles an ocean requirement on Giga', () => {
    const mount = (count: number, max: boolean = false) => shallowMount(CardRequirementComponent, {
      ...globalConfig,
      global: {...globalConfig.global, provide: {boardName: BoardName.GIGA}},
      props: {
        requirement: {oceans: count, count, max},
      },
    });
    expect(mount(5).text()).to.include('10');
    expect(mount(3, true).text()).to.include('max').and.to.include('6');
    // Small requirements are drawn as repeated icons: one ocean becomes two.
    expect(mount(1).findAll('.card-ocean--req')).has.length(2);
    // Other requirements are untouched.
    const temperature = shallowMount(CardRequirementComponent, {
      ...globalConfig,
      global: {...globalConfig.global, provide: {boardName: BoardName.GIGA}},
      props: {requirement: {temperature: -14, count: -14}},
    });
    expect(temperature.text()).to.include('-14');
  });
});
