import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Eye } from "lucide-react";

interface JobCardProps {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  applicants: number;
  status: "active" | "draft" | "closed";
  postedDate: string;
}

export function JobCard({ title, department, location, type, applicants, status, postedDate }: JobCardProps) {
  const statusStyle = {
    active: "status-success",
    draft: "status-warning", 
    closed: "bg-muted text-muted-foreground"
  }[status];

  return (
    <Card className="card-hover bg-gradient-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-2">{title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium">{department}</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </div>
            </div>
          </div>
          <Badge className={statusStyle}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {type}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              {applicants} applicants
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Posted {postedDate}
        </div>
      </CardContent>
    </Card>
  );
}