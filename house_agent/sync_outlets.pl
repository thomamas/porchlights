#!/usr/bin/perl -w

# Copyright 2017 Thomas Insel <tinsel@tinsel.org>
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an "AS
# IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied.  See the License for the specific language
# governing permissions and limitations under the License.

use strict;
use Getopt::Long;
use LWP::UserAgent;

# Arguments

my $local;
my $remote;
my $verbose = 0;

GetOptions('local|l=s' => \$local, 'remote|r=s' => \$remote);

&usage unless defined $local && defined $remote;

$local .= '/' unless $local =~ /\/$/;

#

my $ua = LWP::UserAgent->new();

if (!@ARGV) {
  Sync(1);
} elsif ($ARGV[0] eq 'on') {
  TurnOn('a');
} elsif ($ARGV[0] eq 'off') {
  TurnOff('a');
} elsif ($ARGV[0] eq 'status') {
  $verbose += 2;
  Sync(0);
} elsif ($ARGV[0] eq 'sync') {
  $verbose++;
  Sync(1);
} else {
  &usage;
}

sub usage {
  print "usage: $0 -l local_url -r remote_url [on|off|status|sync]\n";
  exit 1;
}

sub Sync {
  my $action = shift;
  my @r = GetRemote();
  my @l = GetLocal();

  for (0..7) {

    Log($l[$_], $r[$_]);

    if ($l[$_] != $r[$_] && $action) {
      $r[$_] ? TurnOn($_ + 1) : TurnOff($_ + 1);
    }

  }

}

sub Log {
  return unless $verbose > 1;
  my $a = shift;
  my $b = shift;
  print SWord($a);
  print ' -> ' . SWord($b) unless $a == $b;
  print "\n";
}

sub SWord {
  return (shift) ? 'ON' : 'OFF';
}

sub TurnOn {
  my $outlet = shift;
  print "Turning ${outlet} ON\n" if $verbose;
  my $x = GetURL("${local}outlet?${outlet}=ON");
}

sub TurnOff {
  my $outlet = shift;
  print "Turning ${outlet} OFF\n" if $verbose;
  my $x = GetURL("${local}outlet?${outlet}=OFF");
}

sub GetLocal {
  if (GetURL("${local}index.htm") =~/<!-- state=([[:xdigit:]][[:xdigit:]])/) {
    my $state=hex($1);
    return map {
      ($state & (1 << ($_-1))) ? '1' : '0'
    } 1..8;
  }
}

sub GetRemote {
  return split //, GetURL($remote);
}

sub GetURL {
    my $response = $ua->get(shift);
    die $response->status_line if $response->is_error();
    return $response->content;
}
