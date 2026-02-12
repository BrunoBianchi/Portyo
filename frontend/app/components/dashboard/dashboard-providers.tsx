/**
 * DashboardProviders — composes all dashboard context providers into a single wrapper.
 *
 * Replaces 6-level deep nesting in dashboard.tsx:
 *   AuthorizationGuard > BioProvider > BlogProvider > SiteBlogProvider > SiteAutoPostProvider > AutoPostProvider
 */
import React from 'react';
import { AuthorizationGuard } from '~/contexts/guard.context';
import { BioProvider } from '~/contexts/bio.context';
import { BlogProvider } from '~/contexts/blog.context';
import { SiteBlogProvider } from '~/contexts/site-blog.context';
import { SiteAutoPostProvider } from '~/contexts/site-auto-post.context';
import { AutoPostProvider } from '~/contexts/auto-post.context';

export const DashboardProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthorizationGuard>
        <BioProvider>
            <BlogProvider>
                <SiteBlogProvider>
                    <SiteAutoPostProvider>
                        <AutoPostProvider>
                            {children}
                        </AutoPostProvider>
                    </SiteAutoPostProvider>
                </SiteBlogProvider>
            </BlogProvider>
        </BioProvider>
    </AuthorizationGuard>
);
