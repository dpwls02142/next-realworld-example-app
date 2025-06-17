import { useRouter } from 'next/router';
import useSWR from 'swr';
import CustomLink from '../../shared/components/CustomLink';
import NavLink from '../../shared/ui/layout/NavLink';
import checkLogin from '../../lib/utils/checkLogin';
import { getCurrentUser } from '../../lib/utils/supabase/client';

const TabList = () => {
  const { data: currentUser } = useSWR('user', getCurrentUser);
  const isLoggedIn = checkLogin(currentUser);
  const router = useRouter();
  const {
    query: { tag, follow },
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
          <CustomLink
            href={`/?follow=${currentUser?.username}`}
            as={`/?follow=${currentUser?.username}`}
            className={`nav-link ${follow ? 'active' : ''}`}
          >
            Your Feed
          </CustomLink>
        </li>
      )}

      <li className="nav-item">
        <CustomLink
          href="/"
          as="/"
          className={`nav-link ${!follow && !tag ? 'active' : ''}`}
        >
          Global Feed
        </CustomLink>
      </li>

      {tagTab}
    </ul>
  );
};

export default TabList;
