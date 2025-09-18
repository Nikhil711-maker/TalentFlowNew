import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AssessmentBuilderProps {
  jobId: string;
}

export function AssessmentBuilder({ jobId }: AssessmentBuilderProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assessment created yet</h3>
            <p className="text-muted-foreground mb-4">Create an assessment for this job position.</p>
            <Button>Create Assessment</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}