import { Divider, Modal } from 'antd';
import React, { Fragment } from 'react';

import Json from 'components/Json';
import { ResourcePool } from 'types';
import { clone } from 'utils/data';
import { camelCaseToSentence } from 'utils/string';

import { rpLogo } from './ResourcePoolCard';
import css from './ResourcePoolDetails.module.scss';

interface Props {
  finally?: () => void;
  resourcePool: ResourcePool;
  visible: boolean;
}

const ResourcePoolDetails: React.FC<Props> = ({ resourcePool: rp, ...props }: Props) => {

  const details = clone(rp.details);
  for (const key in details) {
    if (details[key] === null) {
      delete details[key];
    }
  }

  const mainSection = clone(rp);
  delete mainSection.details;

  const title = (
    <div>
      {rpLogo(rp.type)}
      {' ' + rp.name}
    </div>
  );

  return (
    <Modal
      cancelButtonProps={{ style: { display: 'none' } }}
      cancelText=""
      mask
      style={{ minWidth: '600px' }}
      title={title}
      visible={props.visible}
      onCancel={props.finally}
      onOk={props.finally}>
      <Json json={mainSection} translateLabel={camelCaseToSentence} />
      {Object.keys(details).map(key => (
        <Fragment key={key}>
          <Divider />
          <div className={css.subTitle}>{camelCaseToSentence(key)}</div>
          <Json json={details[key]} translateLabel={camelCaseToSentence} />
        </Fragment>
      ))}
    </Modal>
  );

};

export default ResourcePoolDetails;
