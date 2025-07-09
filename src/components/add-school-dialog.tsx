
"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { School } from '@/lib/school';
import { Loader2 } from 'lucide-react';

interface AddSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  udise: string; // From login form input
  onSave: (school: School) => Promise<void>;
}

export function AddSchoolDialog({ open, onOpenChange, udise, onSave }: AddSchoolDialogProps) {
  const [schoolName, setSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolUdise, setSchoolUdise] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const finalUdise = udise || schoolUdise;
  const passwordsMatch = password && password === confirmPassword;
  const canSave = finalUdise.length === 11 && schoolName.trim() && schoolAddress.trim() && password.length >= 6 && passwordsMatch;

  useEffect(() => {
    if (open) {
      setSchoolUdise(udise); // Pre-fill UDISE from login form if it exists
      setSchoolName('');
      setSchoolAddress('');
      setPassword('');
      setConfirmPassword('');
      setIsSaving(false);
    }
  }, [open, udise]);

  const handleSave = async () => {
    if (!canSave) return;
    
    setIsSaving(true);
    try {
        await onSave({
            udise: finalUdise,
            name: schoolName.trim(),
            address: schoolAddress.trim(),
            password: password,
        });
        onOpenChange(false);
    } catch (error) {
        // Error is shown on the login page, just need to stop loading state here
        console.error("Save failed from dialog:", error);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Register New School</DialogTitle>
          <DialogDescription>
            {udise
              ? `The school for UDISE ${udise} is not registered. Please enter its details.`
              : "Enter your school's details to create a new account."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="udise-code">UDISE Code</Label>
            <Input 
              id="udise-code" 
              value={finalUdise} 
              onChange={(e) => setSchoolUdise(e.target.value.replace(/\D/g, ''))} 
              disabled={!!udise} 
              maxLength={11} 
              placeholder="Enter 11-digit UDISE code" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school-name">School Name</Label>
            <Input id="school-name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Enter official school name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school-address">Address</Label>
            <Input id="school-address" value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} placeholder="Enter full school address" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password (min. 6 characters)" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your new password" />
          </div>
          {!passwordsMatch && confirmPassword && (
            <p className="text-sm text-destructive">Passwords do not match.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register and Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
