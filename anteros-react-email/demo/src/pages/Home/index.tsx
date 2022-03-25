import { useAppSelector } from '@demo/hooks/useAppSelector';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLoading } from '@demo/hooks/useLoading';
import Frame from '@demo/components/Frame';
import templateList from '@demo/store/templateList';
import { Button } from '@arco-design/web-react';
import { CardItem } from './components/CardItem';
import { Stack } from '@demo/components/Stack';
import { Loading } from '@demo/components/loading';
import { history } from '@demo/utils/history';
import { pushEvent } from '@demo/utils/pushEvent';
import templates from '@demo/config/templates.json';

export default function Home() {
  const dispatch = useDispatch();
  const list = useAppSelector('templateList');
  const loading = useLoading(templateList.loadings.fetch);

  useEffect(() => {
    dispatch(templateList.actions.fetch(undefined));
  }, [dispatch]);

  return (
    <Frame
      title='Templates'
      primaryAction={
        <Button
          onClick={() => {
            pushEvent({ name: 'Create' });
            history.push('/editor');
          }}
        >
          Add
        </Button>
      }
    >
      <>
        <Stack>
          {[...templates, ...list].map((item) => (
            <CardItem data={item} key={item.article_id} />
          ))}
        </Stack>
        <Loading loading={loading}>
          Load user template
        </Loading>
      </>
    </Frame>
  );
}
