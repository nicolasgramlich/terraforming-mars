import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from './getLocalVue';
import GlobalParameterValue from '@/client/components/GlobalParameterValue.vue';
import {GlobalParameter} from '@/common/GlobalParameter';
import {BoardName} from '@/common/boards/BoardName';

describe('GlobalParameterValue', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(GlobalParameterValue, {
      ...globalConfig,
      props: {
        param: GlobalParameter.TEMPERATURE,
        value: -30,
        boardName: BoardName.THARSIS,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });
});
