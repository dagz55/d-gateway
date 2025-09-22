"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Terminal } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type DeploymentMode = "github" | "vercel-cli";
type DeploymentTarget = "production" | "preview";

const DeploymentPage = () => {
  const [branch, setBranch] = useState("main");
  const [commitMessage, setCommitMessage] = useState("feat: New deployment from Zignal dashboard");
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>("github");
  const [isProd, setIsProd] = useState(true);
  const [skipPush, setSkipPush] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setOutput(["Starting deployment..."]);

    const command = [
      "python3",
      "scripts/push_and_deploy.py",
      "--branch", branch,
      "-m", `"${commitMessage}"`,
    ];

    if (deploymentMode === "github") {
      command.push("--via-github");
    } else {
      command.push("--vercel-cli");
      if (isProd) {
        command.push("--prod");
      }
    }
    
    if (!isProd && deploymentMode !== 'vercel-cli') {
        command.push("--preview");
    }

    if (skipPush) {
      command.push("--skip-push");
    }
    if (dryRun) {
      command.push("--dry-run");
    }
    
    setOutput(prev => [...prev, `Executing: ${command.join(" ")}`]);

    // This is a placeholder for the actual command execution.
    // In a real scenario, this would be an API call to a backend that runs the script.
    const mockRun = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOutput(prev => [...prev, "Staging files..."]);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOutput(prev => [...prev, "Committed changes..."]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOutput(prev => [...prev, "Pushing to origin..."]);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if(dryRun){
        setOutput(prev => [...prev, "[DRY RUN] Deployment complete."]);
        return;
      }

      setOutput(prev => [...prev, "Deployment initiated on Vercel..."]);
      await new Promise(resolve => setTimeout(resolve, 5000));
      setOutput(prev => [...prev, "Build successful."]);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOutput(prev => [...prev, "Health checks passed."]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOutput(prev => [...prev, "Deployment successful! Report generated."]);
    };

    await mockRun();
    setIsDeploying(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Push & Deploy</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            A web interface for the <code>push_and_deploy.py</code> script. Configure and run your deployments with ease.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} disabled={isDeploying} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commit-message">Commit Message</Label>
                <Input id="commit-message" value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} disabled={isDeploying} />
              </div>
              <div className="space-y-2">
                <Label>Deployment Mode</Label>
                <RadioGroup value={deploymentMode} onValueChange={(value) => setDeploymentMode(value as DeploymentMode)} className="flex space-x-4" disabled={isDeploying}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="github" id="github" />
                    <Label htmlFor="github">Via GitHub</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vercel-cli" id="vercel-cli" />
                    <Label htmlFor="vercel-cli">Vercel CLI</Label>
                  </div>
                </RadioGroup>
              </div>
               <div className="space-y-2">
                <Label>Target Environment</Label>
                <RadioGroup value={isProd ? "production" : "preview"} onValueChange={(value) => setIsProd(value === "production")} className="flex space-x-4" disabled={isDeploying}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="production" id="production" />
                    <Label htmlFor="production">Production</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="preview" id="preview" />
                    <Label htmlFor="preview">Preview</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Options</Label>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="skip-push" checked={skipPush} onCheckedChange={(checked) => setSkipPush(checked as boolean)} disabled={isDeploying}/>
                    <Label htmlFor="skip-push">Skip Git Push</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="dry-run" checked={dryRun} onCheckedChange={(checked) => setDryRun(checked as boolean)} disabled={isDeploying}/>
                    <Label htmlFor="dry-run">Dry Run</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
               <Button onClick={handleDeploy} disabled={isDeploying} className="w-full">
                {isDeploying ? "Deploying..." : "Deploy"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Terminal className="mr-2 h-5 w-5" />
                Live Output
              </CardTitle>
            </CardHeader>
            <CardContent ref={outputRef} className="flex-grow bg-gray-900 dark:bg-black rounded-md p-4 font-mono text-sm text-gray-300 overflow-y-auto h-96">
              <AnimatePresence>
                {output.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-green-400 mr-2">$</span>{line}
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeploymentPage;