'use client';

import { useEffect } from 'react';
import { useRequireAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { projectsService } from '@/services/projects.service';
import { imagesService } from '@/services/images.service';
import { detectionsService } from '@/services/detections.service';
import { usersService } from '@/services/users.service';
import { FolderKanban, ImageIcon, Camera, Users, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth();

  const { data: projectStats, isLoading: projectsLoading } = useQuery({
    queryKey: ['project-statistics'],
    queryFn: () => projectsService.getStatistics(),
    enabled: !!user,
  });

  const { data: imageStats, isLoading: imagesLoading } = useQuery({
    queryKey: ['image-statistics'],
    queryFn: () => imagesService.getStatistics(),
    enabled: !!user,
  });

  const { data: detectionStats, isLoading: detectionsLoading } = useQuery({
    queryKey: ['detection-statistics'],
    queryFn: () => detectionsService.getStatistics(),
    enabled: !!user,
  });

  const { data: userStats, isLoading: usersLoading } = useQuery({
    queryKey: ['user-statistics'],
    queryFn: () => usersService.getStatistics(),
    enabled: !!user && user.role === 'ADMIN',
  });

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Projets',
      value: projectStats?.totalProjects || 0,
      description: `${projectStats?.totalImages || 0} images`,
      icon: FolderKanban,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      loading: projectsLoading,
    },
    {
      title: 'Images',
      value: imageStats?.total || 0,
      description: `${imageStats?.recentUploads7Days || 0} cette semaine`,
      icon: ImageIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      loading: imagesLoading,
    },
    {
      title: 'Détections',
      value: detectionStats?.total || 0,
      description: `${detectionStats?.validated || 0} validées`,
      icon: Camera,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      loading: detectionsLoading,
    },
  ];

  if (user?.role === 'ADMIN') {
    stats.push({
      title: 'Utilisateurs',
      value: userStats?.total || 0,
      description: `${userStats?.active || 0} actifs`,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      loading: usersLoading,
    });
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue, {user?.firstName} {user?.lastName}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {stat.loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>
                Vos dernières actions sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Aucune activité récente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détections en attente</CardTitle>
              <CardDescription>
                Détections nécessitant une validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {detectionStats?.pending || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                détections à valider
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
