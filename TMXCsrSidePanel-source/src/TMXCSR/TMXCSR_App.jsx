import * as c from '@chakra-ui/react'
import '../App.css'
import TmxCsr from './TmxCsr';
import { useRoutes } from 'react-router-dom';

function TMXCSR_App() {

    const element = useRoutes([
    { path: '', element: <TmxCsr />},
  ]);

  return (
    <c.Box>
      <TmxCsr />
        {/*element*/}
    </c.Box>
  );
}

export default TMXCSR_App