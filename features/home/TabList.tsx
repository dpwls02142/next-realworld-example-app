import { useRouter } from 'next/router';
import useSWR from 'swr';
import CustomLink from '../../shared/components/CustomLink';
import NavLink from '../../shared/ui/layout/NavLink';
import checkLogin from '../../lib/utils/checkLogin';
import storage from '../../lib/utils/storage';

const TabList = () => {
  const { data: currentUser } = useSWR('user', storage);
  const isLoggedIn = checkLogin(currentUser);
  const router = useRouter();
  const {
    query: { tag },
  } = router;

  const tagTab = tag && (
    <li className="nav-item">
      <CustomLink
        href={`/?tag=${tag}`}
        as={`/?tag=${tag}`}
        className="nav-link active"
      >
        <i className="ion-pound" /> {tag}
      </CustomLink>
    </li>
  );

  return (
    <ul className="nav nav-pills outline-active">
      {isLoggedIn && (
        <li className="nav-item">
          <NavLink
            href={`/?user=${currentUser?.username}`}
            as={`/?user=${currentUser?.username}`}
          >
            Your Feed
          </NavLink>
        </li>
      )}

      <li className="nav-item">
        <NavLink href="/" as="/">
          Global Feed
        </NavLink>
      </li>

      {tagTab}
    </ul>
  );
};

export default TabList;
