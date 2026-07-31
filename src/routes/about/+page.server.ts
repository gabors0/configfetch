import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const commitSha = env.VERCEL_GIT_COMMIT_SHA;

	return {
		commit: commitSha ? commitSha.slice(0, 7) : '[development]'
	};
};
