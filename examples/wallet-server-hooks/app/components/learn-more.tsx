import { ExternalLink, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function LearnMore() {
  const resources = [
    {
      title: "Smart Wallets Documentation",
      description: "Complete guide to building with smart wallets",
      url: "https://accountkit.alchemy.com/",
      icon: Book,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Started</CardTitle>
        <CardDescription>
          Build seamless onboarding and transacting flows with smart wallets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {resources.map((resource, index) => {
          const IconComponent = resource.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className="w-full h-auto p-4 justify-start"
              asChild
            >
              <Link
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3"
              >
                <IconComponent className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{resource.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {resource.description}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
